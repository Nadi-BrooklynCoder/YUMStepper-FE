
import { AuthProvider } from './Context/AuthContext';
import AppNav from './Navigation/AppNav';

export default function App() {

  return (
    <AuthProvider>
      <AppNav/>
    </AuthProvider>
  );
}