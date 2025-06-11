import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, X, MapPin, User, Mail, Phone, Home, Package, ShoppingCart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Link, useLocation } from "wouter";
import type { InsertOrder } from "@shared/schema";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "WhatsApp number must be at least 10 characters"),
  shippingAddress: z.string().min(10, "Complete address must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits").max(6, "Pincode must be 6 digits"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", 
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

export default function Checkout() {
  const { state, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch WhatsApp number from settings
  const { data: whatsappData } = useQuery({
    queryKey: ["/api/settings/whatsapp"],
    queryFn: () => api.getWhatsAppNumber(),
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  // Parse weight from product size string
  const parseWeight = (weightStr: string | undefined): number => {
    if (!weightStr) return 1; // Default to 1kg if no weight specified
    
    const cleanStr = weightStr.toLowerCase().trim();
    const numericPart = parseFloat(cleanStr.replace(/[^\d.]/g, ''));
    
    if (isNaN(numericPart)) return 1; // Default to 1kg if parsing fails
    
    // Check if it's in grams (g, gm, gram, grams but not kg, kilogram)
    if ((cleanStr.includes('g') || cleanStr.includes('gram')) && 
        !cleanStr.includes('kg') && !cleanStr.includes('kilogram')) {
      return numericPart / 1000; // Convert grams to kg
    }
    
    // Otherwise assume it's kg (kg, kilogram, kilograms, or no unit)
    return numericPart;
  };

  // Calculate total weight of all items
  const calculateTotalWeight = () => {
    let totalWeight = 0;
    state.items.forEach(item => {
      const itemWeight = parseWeight(item.weight);
      totalWeight += itemWeight * item.quantity;
    });
    return totalWeight;
  };

  // Calculate shipping based on state and weight
  const calculateShipping = () => {
    const totalPrice = getTotalPrice();
    const selectedState = form.watch('state');
    
    // Free shipping if total > ₹1999
    if (totalPrice > 1999) {
      return 0;
    }

    const totalWeight = calculateTotalWeight();

    // Base shipping rates per kg
    let shippingPerKg = selectedState === 'Gujarat' ? 50 : 80;
    
    // Double the rate if weight > 1kg
    if (totalWeight > 1) {
      shippingPerKg *= 2;
    }

    return Math.ceil(totalWeight) * shippingPerKg;
  };

  const totalWeight = calculateTotalWeight();
  const shipping = calculateShipping();
  const subtotal = getTotalPrice();
  const total = subtotal + shipping;

  // Generate WhatsApp message with order details
  const generateWhatsAppMessage = (orderData: CheckoutFormData) => {
    const orderItems = state.items.map(item => 
      `• ${item.name}${item.weight ? ` (${item.weight})` : ''} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `🛒 *NEW ORDER RECEIVED*

👤 *Customer Details:*
Name: ${orderData.customerName}
Email: ${orderData.customerEmail}
WhatsApp: ${orderData.customerPhone}

📦 *Order Items:*
${orderItems}

📍 *Shipping Address:*
${orderData.shippingAddress}
${orderData.city}, ${orderData.state} - ${orderData.pincode}

💰 *Order Summary:*
Subtotal: ₹${subtotal.toFixed(2)}
Shipping: ₹${shipping.toFixed(2)}
*Total: ₹${total.toFixed(2)}*

⚖️ Total Weight: ${totalWeight.toFixed(2)} kg

Please confirm this order and provide delivery timeline.`;

    return encodeURIComponent(message);
  };

  const createOrderMutation = useMutation({
    mutationFn: async (data: { orderData: InsertOrder; formData: CheckoutFormData }) => {
      const response = await api.createOrder(data.orderData);
      return { order: await response.json(), formData: data.formData };
    },
    onSuccess: ({ order, formData }) => {
      // Get WhatsApp number and redirect
      const whatsappNumber = whatsappData?.whatsappNumber;
      
      if (whatsappNumber) {
        const message = generateWhatsAppMessage(formData);
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
        
        // Clear cart and redirect to WhatsApp
        clearCart();
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: "Order placed successfully!",
          description: `Order #${order.id} has been placed. You're being redirected to WhatsApp to confirm the order.`,
        });
        setLocation("/");
      } else {
        // Fallback if no WhatsApp number is configured
        clearCart();
        toast({
          title: "Order placed successfully!",
          description: `Order #${order.id} has been placed. Check your email for confirmation.`,
        });
        setLocation("/");
      }
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (state.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const orderItems = state.items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      weight: item.weight,
    }));

    const fullAddress = `${data.shippingAddress}, ${data.city}, ${data.state} ${data.pincode}`;

    const orderData: InsertOrder = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: fullAddress,
      orderItems,
      totalAmount: total.toFixed(2),
      status: "Processing",
    };

    createOrderMutation.mutate({ orderData, formData: data });
    setIsProcessing(false);
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart to proceed with checkout.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/products">
            <Button variant="ghost" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Summary */}
          <div className="lg:order-2">
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Cart Summary</CardTitle>
                </div>
                <p className="text-sm text-gray-500">{state.items.length} items</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {state.items.map((item, index) => (
                    <div key={`${item.productId}-${item.weight}`} className="flex items-center space-x-3 py-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Size: {item.weight || 'Standard'} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Weight</span>
                    <span className="font-medium">
                      {totalWeight < 1 ? `${(totalWeight * 1000).toFixed(0)}g` : `${totalWeight.toFixed(2)}kg`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:order-1">
            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="text-xl flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Checkout Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Number *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="+91 98765 43210" 
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +91 for India)</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Shipping Address
                      </h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="shippingAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complete Address *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="House/Flat number, Street name, Area, Landmark"
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {indianStates.map(state => (
                                      <SelectItem key={state} value={state}>
                                        {state}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode *</FormLabel>
                                <FormControl>
                                  <Input placeholder="123456" maxLength={6} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Shipping Information</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Free shipping on orders above ₹1,999</li>
                        <li>• Gujarat: ₹50/kg, Outside Gujarat: ₹80/kg</li>
                        <li>• Shipping rates double for total weight above 1kg</li>
                        <li>• Weight calculated from product sizes (g/gm = grams, kg = kilograms)</li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setLocation("/products")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isProcessing || createOrderMutation.isPending}
                      >
                        {isProcessing ? (
                          "Processing..."
                        ) : (
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {whatsappData?.whatsappNumber ? "Continue to WhatsApp" : "Continue to Review"}
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}