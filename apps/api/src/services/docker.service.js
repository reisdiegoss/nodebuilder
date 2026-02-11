import Docker from 'dockerode';
export class DockerService {
    docker;
    constructor() {
        // No Windows, o Docker pode rodar via Named Pipe ou TCP. 
        // O padrão é o npipe.
        this.docker = new Docker({ socketPath: '//./pipe/docker_engine' });
    }
    async testConnection() {
        try {
            const info = await this.docker.info();
            return { ok: true, serverVersion: info.ServerVersion };
        }
        catch (error) {
            console.error('Docker Error:', error);
            return { ok: false, error: 'Could not connect to Docker Engine' };
        }
    }
    async createSandbox(projectName, port) {
        // Lógica para subir um container Node.js base
        const container = await this.docker.createContainer({
            Image: 'node:20-alpine',
            name: `nb-sandbox-${projectName}`,
            ExposedPorts: { '3000/tcp': {} },
            HostConfig: {
                PortBindings: { '3000/tcp': [{ HostPort: port.toString() }] }
            },
            Cmd: ['node', '-e', 'console.log("Sandbox NodeBuilder Ready")']
        });
        await container.start();
        return container.id;
    }
}
export const dockerService = new DockerService();
//# sourceMappingURL=docker.service.js.map