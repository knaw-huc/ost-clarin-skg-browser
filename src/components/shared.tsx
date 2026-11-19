import type {ReactNode} from "react";
import {Link} from "@tanstack/react-router";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {ApiError} from "../api.ts";

export function NotFound({ what }: { what: string }) {
    return (
        <div className="empty">
            <p>{what}</p>
            <Link to="/">Back to start</Link>
        </div>
    )
}

export const Alert = ({ error }: { error: Error }) => {
    const status = error instanceof ApiError ? error.status : undefined;
    const msg = status === 502 ? 'The API could not reach the triple store.' :
        status === undefined ? 'Is the API running and reachable?' : undefined;

    return (<div className='error' role='alert'>
        <strong>{status ? `Error ${status}` : 'Request failed'}</strong> {error.message}
        {msg && <div className='error-hint'>{msg}</div>}
    </div>);
}

export const Field = ({ label, children }: { label: string, children: ReactNode }) => {
    return (<div className='field'>
        <dt>{label}</dt>
        <dd>{children}</dd>
    </div>);
}

export const EntityLink = (
    { path, id, className, children }:  { path: string; id: string; className?: string; children: ReactNode }
) => {
    return (<Link key={id} to='/$entity/$id' params={{ entity: path, id }} className={className}>{children}</Link>);
}


const rehypePlugins = [rehypeRaw, rehypeSanitize]

export const LanguageValues = ({ map, markdown }: { map?: Record<string, string | string[]>; markdown?: boolean })=> {
    if (!map) {
        return null;
    }

    return (
        <>
            {Object.entries(map).flatMap(([lang, values]) =>
                (Array.isArray(values) ? values : [values]).map((v, i) => {
                    const tag = lang !== 'none' && <span className="lang">{lang}</span>
                    return markdown ? (
                        <div key={`${lang}-${i}`} className="lang-value markdown">
                            {tag}
                            <Markdown rehypePlugins={rehypePlugins}>{v}</Markdown>
                        </div>
                    ) : (
                        <p key={`${lang}-${i}`} className="lang-value">
                            {tag}
                            {v}
                        </p>
                    )
                }),
            )}
        </>
    );
}
