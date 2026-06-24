import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  CreditCard,
  IndianRupee,
  Mail,
  PackageCheck,
  Phone,
  User,
  Users,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { DashboardHeader } from "../../../../components/Dashboard/dashboardHeader";
import { DashboardShell } from "../../../../components/Dashboard/dashboardShell";
import { getAllUsersWithBookingsForAdmin } from "../../../../store/admin/order-slice";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (dateString) => {
  if (!dateString) return "Not available";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getPackageTitle = (order) =>
  order?.tourPackageSnapshot?.title ||
  order?.tourPackageId?.title ||
  "Package unavailable";

const getBookingTotal = (order) =>
  order?.totalPayable || order?.totalPrice || 0;

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-md border p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value || "Not available"}</p>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isLoading, userList, error } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    dispatch(getAllUsersWithBookingsForAdmin());
  }, [dispatch]);

  const user = useMemo(
    () => userList.find((item) => item._id === id),
    [id, userList]
  );

  const bookings = user?.orders || [];
  const stats = useMemo(() => {
    const paid = bookings.filter((order) => order.paymentStatus === "Paid");
    const confirmed = bookings.filter((order) => order.orderStatus === "Confirmed");
    const revenue = bookings.reduce(
      (total, order) => total + Number(getBookingTotal(order)),
      0
    );

    return {
      bookings: bookings.length,
      paid: paid.length,
      confirmed: confirmed.length,
      revenue,
    };
  }, [bookings]);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="User Detail"
        text="View the selected user profile and booking history."
      >
        <Button asChild variant="outline">
          <Link to="/Dashboard/users">Back to Users</Link>
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="rounded-md border p-6 text-center text-muted-foreground">
          Loading user detail...
        </div>
      ) : error ? (
        <div className="rounded-md border p-6 text-center text-destructive">
          {error}
        </div>
      ) : !user ? (
        <div className="rounded-md border p-6 text-center">
          <p className="font-medium">User not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The selected user id does not match any record in the admin list.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-md">
              <CardHeader className="pb-3">
                <CardDescription>User</CardDescription>
                <CardTitle className="text-2xl">{user.userName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Phone" value={user.phone} />
              </CardContent>
            </Card>

            <Card className="rounded-md">
              <CardHeader className="pb-3">
                <CardDescription>Bookings</CardDescription>
                <CardTitle className="text-2xl">{stats.bookings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={PackageCheck} label="Confirmed" value={stats.confirmed} />
                <InfoRow icon={CreditCard} label="Paid" value={stats.paid} />
              </CardContent>
            </Card>

            <Card className="rounded-md">
              <CardHeader className="pb-3">
                <CardDescription>Total Value</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(stats.revenue)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={IndianRupee} label="Account Type" value={user.role} />
                <InfoRow icon={CalendarDays} label="Joined" value={formatDate(user.createdAt)} />
              </CardContent>
            </Card>

            <Card className="rounded-md">
              <CardHeader className="pb-3">
                <CardDescription>Record</CardDescription>
                <CardTitle className="text-2xl">Admin View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={User} label="Username" value={user.userName} />
                <InfoRow icon={Users} label="Bookings linked" value={bookings.length} />
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>
                Each booking placed by this user with payment and approval status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookings.length === 0 ? (
                <div className="rounded-md border p-6 text-center text-muted-foreground">
                  No bookings found for this user.
                </div>
              ) : (
                bookings.map((order) => (
                  <div key={order._id} className="rounded-md border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{getPackageTitle(order)}</p>
                        <p className="text-sm text-muted-foreground">
                          Booked on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={order.paymentStatus === "Paid" ? "default" : "outline"}>
                          {order.paymentStatus || "Pending"}
                        </Badge>
                        <Badge variant={order.orderStatus === "Confirmed" ? "default" : "secondary"}>
                          {order.orderStatus || "Processing"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <InfoRow
                        icon={IndianRupee}
                        label="Total"
                        value={formatCurrency(getBookingTotal(order))}
                      />
                      <InfoRow
                        icon={Users}
                        label="Travelers"
                        value={order.travelers?.length || order.quantity || 0}
                      />
                      <InfoRow
                        icon={PackageCheck}
                        label="Quantity"
                        value={order.quantity || 1}
                      />
                    </div>

                    {order.travelers?.length ? (
                      <div className="mt-4 rounded-md border bg-muted/20 p-4">
                        <p className="mb-2 text-sm font-medium">Traveler Details</p>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {order.travelers.map((traveler, index) => (
                            <div key={`${order._id}-${index}`} className="rounded-md border bg-background p-3 text-sm">
                              <p className="font-medium">{traveler.name}</p>
                              <p className="text-muted-foreground">
                                Age: {traveler.age} | Gender: {traveler.gender}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
