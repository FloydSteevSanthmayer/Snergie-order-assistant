import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Calendar, ArrowLeft, Truck, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderWithDetails {
  id: string;
  tracking_number: string;
  status: string;
  expected_delivery_date: string;
  total_amount: number;
  created_at: string;
  customers: {
    name: string;
    email: string;
    address: string;
  };
  order_items: {
    quantity: number;
    unit_price: number;
    products: {
      name: string;
      image_url: string;
    };
  }[];
}

interface OrderStatus {
  id: string;
  status: string;
  location_details: string;
  created_at: string;
  updated_at: string;
}

export default function Tracking() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      fetchOrderDetails();
    }
  }, [trackingNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order with customer and items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          customers!orders_customer_id_fkey (
            name,
            email,
            address
          ),
          order_items (
            quantity,
            unit_price,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('tracking_number', trackingNumber)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch order status history
      const { data: statusData, error: statusError } = await supabase
        .from('order_status')
        .select('*')
        .eq('order_id', orderData.id)
        .order('created_at', { ascending: false });

      if (statusError) throw statusError;
      setOrderStatuses(statusData || []);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Order not found or invalid tracking number');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'placed':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'dispatched':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'in transit':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'out for delivery':
        return <MapPin className="h-5 w-5 text-yellow-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'placed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dispatched':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in transit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out for delivery':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tracking Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/orders')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Package Tracking</h1>
            <p className="text-muted-foreground">Tracking Number: {trackingNumber}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customers.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customers.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="text-sm">{order.customers.address}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Expected Delivery</p>
                  <p className="font-medium">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {new Date(order.expected_delivery_date).toLocaleDateString()}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.products.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tracking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderStatuses.length > 0 ? (
                    orderStatuses.map((status, index) => (
                      <div key={status.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          {getStatusIcon(status.status)}
                          {index < orderStatuses.length - 1 && (
                            <div className="w-px h-8 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(status.status)}>
                              {status.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(status.updated_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{status.location_details}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No tracking updates available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}