import {observer} from "mobx-react-lite";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SectionLayout from "Components/common/SectionLayout.jsx";
import MarketplaceRoutes from "Pages/marketplace/MarketplaceRoutes.jsx";

const AppRoutes = observer(() => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SectionLayout />}>
          <Route path="/" element={<div>Home</div>}/>
        </Route>
      </Routes>
      <MarketplaceRoutes rootPath="/marketplaces" />
    </BrowserRouter>
  );
});

export default AppRoutes;
