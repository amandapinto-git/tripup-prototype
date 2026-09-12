import { HashRouter, Routes, Route } from 'react-router-dom';
import { TripProvider } from './state/TripContext';
import PhoneShell from './components/PhoneShell';
import ThemeColorSync from './components/ThemeColorSync';
import PollCloseDemo from './components/PollCloseDemo';
import HomeScreen from './screens/HomeScreen';
import TripScreen from './screens/trip/TripScreen';
import AddExpenseFlow from './screens/addExpense/AddExpenseFlow';
import AddPlanFlow from './screens/addPlan/AddPlanFlow';

export default function App() {
  return (
    <TripProvider>
      <HashRouter>
        <ThemeColorSync />
        <PhoneShell>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/trip/:tripId" element={<TripScreen />} />
            <Route path="/trip/:tripId/add-expense" element={<AddExpenseFlow />} />
            <Route path="/trip/:tripId/add-plan" element={<AddPlanFlow />} />
          </Routes>
          <PollCloseDemo />
        </PhoneShell>
      </HashRouter>
    </TripProvider>
  );
}
