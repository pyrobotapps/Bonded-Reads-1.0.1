import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BooksListPage from "./pages/BooksListPage";
import BookDetailPage from "./pages/BookDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import LibraryPage from "./pages/LibraryPage";
import AdminPage from "./pages/AdminPage";
import RecommendPage from "./pages/RecommendPage";
import MyRecommendationsPage from "./pages/MyRecommendationsPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App min-h-screen bg-background">
          <BrowserRouter>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/non-abo" element={<BooksListPage title="Non-ABO Books" isAbo={false} />} />
                <Route path="/abo" element={<BooksListPage title="ABO Books" isAbo={true} />} />
                <Route path="/checklists" element={<BooksListPage title="Full Checklists" isAbo={null} />} />
                <Route path="/recommend" element={<RecommendPage />} />
                <Route path="/my-recommendations" element={<MyRecommendationsPage />} />
                <Route path="/book/:id" element={<BookDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/staff-login" element={<StaffLoginPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
