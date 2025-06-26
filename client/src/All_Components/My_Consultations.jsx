import Navigation from "./Navigator";
import { ProfileSection } from "./Short_COmponents/Profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  }
]

const My_Consultations = () => {
  return (
    <div className=" px-2 sm:px-4 min-h-screen">
      <div className=" max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
          <div className="card-3 w-full">
            <Card className="w-full rounded-sm shadow-sm  border border-gray-200">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold">Overview Consulting</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-2 sm:p-4">
          <Table>
      <TableCaption>A list of your recent Consultations.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
        </CardContent>
      </Card>
          </div>
          </div>

          <div className="lg:col-span-1 max-lg:hidden">
            <ProfileSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default My_Consultations
