import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import CalendarPage from "@/pages/Calendar";
import Orders from "@/pages/Orders";
import Finance from "@/pages/Finance";
import Salary from "@/pages/Salary";
import Services from "@/pages/Services";
import Employees from "@/pages/Employees";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/orders" component={Orders} />
        <Route path="/finance" component={Finance} />
        <Route path="/salary" component={Salary} />
        <Route path="/services" component={Services} />
        <Route path="/employees" component={Employees} />
        <Route path="/messages" component={Messages} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
