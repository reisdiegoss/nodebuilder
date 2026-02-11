export declare class DockerService {
    private docker;
    constructor();
    testConnection(): Promise<{
        ok: boolean;
        serverVersion: any;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        serverVersion?: undefined;
    }>;
    createSandbox(projectName: string, port: number): Promise<string>;
}
export declare const dockerService: DockerService;
//# sourceMappingURL=docker.service.d.ts.map