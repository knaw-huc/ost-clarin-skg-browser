import {createRoute, createRouter, redirect, type AnyRoute} from "@tanstack/react-router";
import Layout from "./components/Layout.tsx";
import {EntityListPage} from "./components/EntityList.tsx";
import EntityDetails from "./components/EntityDetails.tsx";

const rootRoute: AnyRoute = createRoute({ component: Layout });

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/$entity', params: { entity: 'products' } })
    }
});

const entityListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path : '$entity',
    component: EntityListPage
});

const detailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$entity/$id',
    component: EntityDetails
});

export const router = createRouter({
    routeTree: rootRoute.addChildren([ indexRoute, entityListRoute, detailsRoute ]),
    defaultPreload: 'intent'
});