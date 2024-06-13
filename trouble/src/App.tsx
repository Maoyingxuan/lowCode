import {BrowserRouter as Router,Route,Routes} from "react-router-dom"
import EditPage from "./pages/EditPage"
import ListPage from "./pages/ListPage"
import RequireAuth from "./components/RequireAuth"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequireAuth/>}>
          <Route index element={<EditPage />}></Route>
          <Route path="list" element={<ListPage />}></Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
