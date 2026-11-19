import {createRoute, createRouter, redirect, createRootRoute} from "@tanstack/react-router";
import Layout from "./components/Layout.tsx";
import {EntityListPage} from "./components/EntityList.tsx";
import {EntityDetailsPage} from "./components/EntityDetails.tsx";

const rootRoute = createRootRoute({ component: Layout });

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
    validateSearch: (search: Record<string, unknown>): { page?: number; pageSize?: number } => ({
        page: Number(search.page) || undefined,
        pageSize: Number(search.pageSize) || undefined,
    }),
    component: EntityListPage
});

const detailsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$entity/$id',
    component: EntityDetailsPage
});

export const router = createRouter({
    routeTree: rootRoute.addChildren([ indexRoute, entityListRoute, detailsRoute ]),
    defaultPreload: 'intent'
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}