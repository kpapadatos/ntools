import express, { Request, Response, Router } from 'express';
import { Server } from 'http';
import { PromMetricCompiler } from './PromMetricCompiler';

export class MetricServer {
    private static defaultOptions: IMetricServerOptions = {
        port: 8080,
        path: '/metrics'
    };
    public static create(
        factory: MetricFactory,
        options?: Partial<IMetricServerOptions>
    ) {
        const server = new MetricServer(factory, {
            ...this.defaultOptions,
            ...options
        });

        server.listen();

        return server;
    }
    private server?: Server;
    private readonly app = express();
    private readonly router: Router;
    private constructor(
        private factory: MetricFactory,
        private options: IMetricServerOptions
    ) {
        this.router = 'router' in options ? options.router : Router();
        this.router.use(options.path, this.handler.bind(this));
        this.app.use(this.router);
    }
    public close() {
        this.server?.close();
    }
    private listen() {
        if ('port' in this.options && !this.server) {
            this.server = this.app.listen(this.options.port, this.options.listenCallback);
        }
    }
    private async handler(_req: Request, res: Response) {
        const metrics = await this.factory();
        const metricsTxt = PromMetricCompiler.compile(metrics);

        res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');

        res.end(metricsTxt);
    }
}

export type IMetricServerOptions = { path: string } & (IMetricServerListenOptions | IMetricServerMountOptions);

export interface IMetricServerListenOptions {
    port: number;
    listenCallback?: () => void | Promise<void>;
}

export interface IMetricServerMountOptions {
    router: Router;
}

export interface IMetric {
    name: string;
    type: 'gauge';
    help: string;
    values: IMetricValue[];
}

export interface IMetricValue {
    labels: IMetricLabel[];
    value: number;
}

export interface IMetricLabel {
    name: string;
    value: string;
}

export type MetricFactory = () => Promise<IMetric[]> | IMetric[];