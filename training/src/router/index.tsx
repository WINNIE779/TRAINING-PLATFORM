import { DataAnnotation } from "@/pages/data-annotation";
import { DataManagement } from "@/pages/data-management";
import { MenuBar } from "@/pages/menu-bar";
import { SimulationTraining } from "@/pages/simulation-training";
import { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";

export interface IRouteItem {
  key: string;
  path: string;
  element: ReactElement;
  children?: IRouteItem[];
}

const routesList: IRouteItem[] = [
  {
    key: "data-management",
    path: "/data-management",
    element: <DataManagement />,
  },
  {
    key: "data-annotation",
    path: "/data-annotation",
    element: <DataAnnotation />,
  },
  {
    key: "simulation-training",
    path: "/simulation-training",
    element: <SimulationTraining />,
  },
];

export const Router = () => {
  return (
    <Routes>
      <Route element={<MenuBar />}>
        <Route path="/" element={<DataManagement />} />
        {routesList.map((route) => (
          <Route key={route.key} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
};
