import {useQuery} from "@tanstack/react-query";
import {fetchList} from "../api.ts";
import {Link, useNavigate, useParams, useSearch} from "@tanstack/react-router";
import {type EntityConfig, getEntityConfig} from "../entities.ts";

const DEFAULT_PAGE_SIZE = 20;

const NotFound = () => {
    return (<div>Entity not found!</div>);
}

export const EntityListPage = () => {
    const { entity } = useParams({ from: '/$entity' });
    const config = getEntityConfig(entity);
    if (!config) {
        return <NotFound />;
    }
    return EntityList(config);
}

const EntityList = (config: EntityConfig) => {
    const search = useSearch({ from: '/$entity' });
    const navigate = useNavigate({ from: '/$entity' });
    const page = search.page ?? 1;
    const pageSize = search.size ?? DEFAULT_PAGE_SIZE;
    const { data: result, isFetching } = useQuery({
        queryKey: ['entity-list'],
        queryFn: () => fetchList(`${config.path}`, {
            pageSize,
            page,
            filters: []
        })
    });


    const data = result?.items
    const totalItems = result?.totalItems;
    const totalPages = totalItems !== undefined ? Math.ceil(totalItems / pageSize) : undefined;
    const hasNext = totalPages !== undefined ? page < totalPages : (data?.length ?? 0) === pageSize;


    return (<section>
        {data && data.length > 0 && (
            <ul className={`results${isFetching ? ' stale' : ''}`}>
                {data.map((item) => {
                    const subtitle = config.subtitle(item)
                    const productType = typeof item.product_type === 'string' ? item.product_type : undefined
                    return (
                        <li key={item.local_identifier}>
                            <Link to="/$entity/$id" params={{ entity: config.path, id: item.local_identifier }} className="result">
                                <span className="result-title">{config.title(item)}</span>
                                {productType && <span className="badge">{productType}</span>}
                                {subtitle && <span className="result-subtitle">{subtitle}</span>}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        )}
        {(page > 1 || hasNext) && (
            <nav className="pager" aria-label="Pagination">
                <button disabled={page <= 1} onClick={() => navigate({ search: (prev) => ({ ...prev, page: undefined }) })}>
                    « First
                </button>
                <button disabled={page <= 1} onClick={() => navigate({ search: (prev) => ({ ...prev, page: page - 1 > 1 ? page - 1 : undefined }) })}>
                    ← Previous
                </button>
                <span>Page {page}{totalPages !== undefined && ` of ${totalPages.toLocaleString()}`}</span>
                <button disabled={!hasNext} onClick={() => navigate({ search: (prev) => ({ ...prev, page: page + 1 }) })}>
                    Next →
                </button>
                {totalPages !== undefined && (
                    <button disabled={page >= totalPages} onClick={() => navigate({ search: (prev) => ({ ...prev, page: totalPages > 1 ? totalPages : undefined }) })}>
                        Last »
                    </button>
                )}
            </nav>
        )}
    </section>);
}