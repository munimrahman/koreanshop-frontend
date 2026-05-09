import { CheckCircle, FileText, Package, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Order } from "@/lib/api/orders";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { cloudfrontLoader } from "@/lib/cloudfront-loader";

const ORDER_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

const getStatusColor = (status: string) => {
  const statusColors = {
    [ORDER_STATUSES.DELIVERED]: "bg-green-100 text-green-800",
    [ORDER_STATUSES.SHIPPED]: "bg-purple-100 text-purple-800",
    [ORDER_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
    [ORDER_STATUSES.CONFIRMED]: "bg-cyan-100 text-cyan-800",
    [ORDER_STATUSES.CANCELLED]: "bg-red-100 text-red-800",
    // Legacy status support
    delivered: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    statusColors[status as keyof typeof statusColors] ||
    "bg-gray-100 text-gray-800"
  );
};

interface OrderDetailDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onUpdatePaymentStatus: (orderId: string, paymentStatus: string) => void; // Add this
}

export const OrderDetailDialog = ({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
  onUpdatePaymentStatus,
}: OrderDetailDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="mx-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl">
          Order Details - {order?.orderNumber}
        </DialogTitle>
      </DialogHeader>
      {order && (
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-sm sm:text-base">
                Customer Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong> {order.customerName}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <span className="break-all">{order.email}</span>
                </p>
                <p>
                  <strong>Phone:</strong> {order.phone}
                </p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-sm sm:text-base">
                Order Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Order Status:</strong>
                  <Badge
                    className={`text-xs ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </Badge>
                </p>
                <p className="flex items-center gap-2">
                  <strong>Payment Status:</strong>
                  <Badge variant="outline" className="text-xs">
                    {order.paymentStatus}
                  </Badge>
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {order.paymentMethod.replace("_", " ")}
                </p>
                <p>
                  <strong>Total:</strong> ৳{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping & Billing Addresses */}
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-sm sm:text-base">
                Shipping Address
              </h3>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {order.shippingAddress}
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-sm sm:text-base">
                Billing Address
              </h3>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {order.billingAddress}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="mb-3 font-semibold text-sm sm:text-base">
              Order Summary
            </h3>
            <div className="space-y-2 bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Items ({order.itemCount}):</span>
                <span>
                  ৳
                  {(
                    order.totalAmount -
                    order.shippingFee +
                    order.discountAmount
                  ).toFixed(2)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-600 text-sm">
                  <span>Discount:</span>
                  <span>-৳{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span>Shipping Fee:</span>
                <span>৳{order.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t font-semibold">
                <span>Total Amount:</span>
                <span>৳{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div>
              <h3 className="mb-2 font-semibold text-sm sm:text-base">
                Order Notes
              </h3>
              <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-lg text-sm">
                {order.notes}
              </div>
            </div>
          )}

          {/* Order Items - Since the API response doesn't include items, show placeholder */}
          <div>
            <h3 className="mb-3 font-semibold text-sm sm:text-base">
              Order Items
            </h3>
            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="bg-white border rounded-lg min-w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 font-medium text-left">
                        Product
                      </th>
                      <th className="px-3 py-2 font-medium text-left">
                        Variation
                      </th>
                      <th className="px-3 py-2 font-medium text-center">Qty</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Unit Price
                      </th>
                      <th className="px-3 py-2 font-medium text-right">
                        Discount
                      </th>
                      <th className="px-3 py-2 font-medium text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="flex items-center gap-2 px-3 py-2">
                          {item.productVariation?.imageUrl ||
                          item.productVariation?.product?.baseImageUrl ? (
                            <div className="relative w-10 h-10 overflow-hidden rounded border">
                              <Image
                                src={
                                  item.productVariation.imageUrl ||
                                  item.productVariation.product.baseImageUrl
                                }
                                alt={item.productName}
                                fill
                                loader={cloudfrontLoader}
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex justify-center items-center bg-gray-100 border rounded w-10 h-10 text-gray-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <span>{item.productName}</span>
                        </td>
                        <td className="px-3 py-2">
                          {item.variationName || item.productVariation?.name}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right">
                          ৳{parseFloat(item.priceAtPurchase).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.discountAmount &&
                          parseFloat(item.discountAmount) > 0 ? (
                            <>
                              -৳{parseFloat(item.discountAmount).toFixed(2)}
                              {item.discountPercentage && (
                                <> ({parseFloat(item.discountPercentage)}%)</>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-medium text-right">
                          ৳
                          {(
                            parseFloat(item.priceAtPurchase) * item.quantity -
                            parseFloat(item.discountAmount || "0") *
                              item.quantity
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg text-muted-foreground text-sm text-center">
                <Package className="mx-auto mb-2 w-8 h-8" />
                <p>
                  Order contains {order.itemCount} item
                  {order.itemCount !== 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-xs">No item details available</p>
              </div>
            )}
          </div>

          {/* Order Metadata */}
          <div className="pt-4 border-t">
            <h3 className="mb-2 font-semibold text-sm sm:text-base">
              Order Metadata
            </h3>
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 text-muted-foreground text-sm">
              <div>
                <p>
                  <strong>Creation Method:</strong> {order.creationMethod}
                </p>
                <p>
                  <strong>Cart Session ID:</strong>{" "}
                  <code className="text-xs">{order.cartSessionId}</code>
                </p>
              </div>
              <div>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="mb-2 font-medium text-sm">Order Status Actions</h4>
            <div className="flex sm:flex-row flex-col gap-2">
              <Button
                onClick={() =>
                  onUpdateStatus(order.id, ORDER_STATUSES.CONFIRMED)
                }
                className="flex-1 sm:flex-none"
                size="sm"
                disabled={order.orderStatus === ORDER_STATUSES.CONFIRMED}>
                Mark Confirmed
              </Button>
              <Button
                onClick={() => onUpdateStatus(order.id, ORDER_STATUSES.SHIPPED)}
                className="flex-1 sm:flex-none"
                size="sm"
                disabled={order.orderStatus === ORDER_STATUSES.SHIPPED}>
                Mark Shipped
              </Button>
              <Button
                onClick={() =>
                  onUpdateStatus(order.id, ORDER_STATUSES.DELIVERED)
                }
                className="flex-1 sm:flex-none"
                size="sm"
                disabled={order.orderStatus === ORDER_STATUSES.DELIVERED}>
                Mark Delivered
              </Button>
            </div>
          </div>

          {/* Payment Status Actions */}
          <div>
            <h4 className="mb-2 font-medium text-sm">Payment Status Actions</h4>
            <div className="flex sm:flex-row flex-col gap-2">
              <Button
                onClick={() =>
                  onUpdatePaymentStatus(order.id, PAYMENT_STATUSES.PAID)
                }
                className="flex-1 sm:flex-none"
                size="sm"
                variant="outline"
                disabled={order.paymentStatus === PAYMENT_STATUSES.PAID}>
                <CheckCircle className="mr-2 w-4 h-4 text-green-600" />
                Mark Paid
              </Button>
              <Button
                onClick={() =>
                  onUpdatePaymentStatus(order.id, PAYMENT_STATUSES.FAILED)
                }
                className="flex-1 sm:flex-none"
                size="sm"
                variant="outline"
                disabled={order.paymentStatus === PAYMENT_STATUSES.FAILED}>
                <XCircle className="mr-2 w-4 h-4 text-red-600" />
                Mark Failed
              </Button>
              <Button
                onClick={() =>
                  onUpdatePaymentStatus(order.id, PAYMENT_STATUSES.REFUNDED)
                }
                className="flex-1 sm:flex-none"
                size="sm"
                variant="outline"
                disabled={order.paymentStatus === PAYMENT_STATUSES.REFUNDED}>
                <XCircle className="mr-2 w-4 h-4 text-orange-600" />
                Mark Refunded
              </Button>
            </div>
          </div>

          {/* Other Actions */}
          <div>
            <h4 className="mb-2 font-medium text-sm">Other Actions</h4>
            {order.invoiceUrl ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(order.invoiceUrl, "_blank")}>
                <FileText className="mr-2 w-4 h-4" />
                View Invoice
              </Button>
            ) : (
              <Button variant="outline" size="sm">
                <FileText className="mr-2 w-4 h-4" />
                Generate Invoice
              </Button>
            )}
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);
// Loading component
