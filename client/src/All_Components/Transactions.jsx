import { useState } from "react";
import Navigation from "./Navigator";
import { ProfileSection } from "./Short_COmponents/Profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button";

const transactions = [
  {
    type: "Payment",
    amount: "$120.00",
    time: "2025-05-21 14:32",
    description: "Payment for online consultation with Dr. Emily Johnson",
  },
  {
    type: "Refund",
    amount: "$50.00",
    time: "2025-05-20 09:45",
    description: "Refund issued for cancelled session",
  },
  {
    type: "Deposit",
    amount: "$300.00",
    time: "2025-05-19 16:10",
    description: "Wallet top-up via credit card",
  },
  {
    type: "Withdrawal",
    amount: "$200.00",
    time: "2025-05-18 11:05",
    description: "Withdrawn to bank account ending in 4521",
  }
];


const Transactions = () => {
    const [message, setMessage] = useState('');

    const handleViewMessage = (msg)=>{
        setMessage(msg)
    }
  return (
    <div className=" px-2 sm:px-4 min-h-screen">
      <div className=" max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
           
          <div className="card-3 w-full">
            <Card className="w-full rounded-sm shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold">Transactions</CardTitle>
          </div>
          <div className=" flex items-center gap-4 justify-start">
            <p className=" font-[350] font-sans">You have €0.00 in your wallet</p>
            <Button variant="brand">+CHARGE</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-2 sm:p-4">
          <Table>
  <TableCaption>A list of your recent Transactions.</TableCaption>
  <TableHeader>
    <TableRow>
       <TableHead>Type</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Time</TableHead>
      <TableHead>Description</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {transactions.map((txn, index) => (
      <TableRow key={index}>
         <TableCell>{txn.type}</TableCell>
        <TableCell>{txn.amount}</TableCell>
        <TableCell>{txn.time}</TableCell>
            <TableCell>{txn.description.slice(0,20)}...   
                <Dialog>
      <DialogTrigger asChild>
        <span className="text-base text-[#3B5EB7] hover:underline cursor-pointer" onClick={()=>handleViewMessage(txn.description)}>See</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription>
            Response
          </DialogDescription>
        </DialogHeader>
        <p className=" text-base font-[350] font-sans">{message}</p>
      </DialogContent>
    </Dialog></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
        </CardContent>
      </Card>
          </div>
          <div className=" mt-2">
            <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
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

export default Transactions
