import { IMetric, IMetricValue } from './MetricServer';

export class PromMetricCompiler {
    public static compile(metrics: IMetric[]) {
        return new PromMetricCompiler(metrics).getMetricsTXT();
    }
    private metricsTxt: string;
    private constructor(private metrics: IMetric[]) {
        this.metricsTxt = this.compile();
    }
    private getMetricsTXT() {
        return this.metricsTxt;
    }
    private compile() {
        let metricsTxt = '';

        for (const { name, help, type, values } of this.metrics) {
            metricsTxt += `\n# HELP ${name} ${help}`;
            metricsTxt += `\n# TYPE ${name} ${type}`;

            for (const value of values) {
                metricsTxt += this.compileValue(value);
            }

            metricsTxt += '\n';
        }

        return metricsTxt;
    }
    private compileValue({ value, labels }: IMetricValue) {
        let labelsStr = labels.map(({ name, value }) => `${name}="${value}"`).join(' ');

        if (labelsStr) {
            labelsStr = `{${labelsStr}}`;
        }

        return `\n${name}${labelsStr} ${value}`;
    }
}