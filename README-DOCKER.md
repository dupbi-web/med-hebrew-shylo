Docker Production Setup Guide
Overview
This production Dockerfile implements industry best practices for containerizing the React/Vite application with security, performance, and reliability in mind.

Key Features
🔒 Security Hardening
Non-root user: Application runs as nginx-app (UID 1001) instead of root
Minimal base images: Uses Alpine Linux for smaller attack surface
Security headers: CSP, X-Frame-Options, X-Content-Type-Options, etc.
No privileged ports: Uses port 8080 instead of 80
Read-only filesystem: Optional read-only root filesystem support
⚡ Performance Optimization
Multi-stage builds: Separates dependencies, build, and production stages
Layer caching: Optimized layer ordering for faster rebuilds
Compression: Gzip enabled for all text-based assets
Static asset caching: 1-year cache for immutable assets
Production dependencies only: Final image contains only runtime dependencies
🏗️ Build Optimization
Separate dependency stage: Caches npm dependencies independently
npm ci: Uses clean install for reproducible builds
Minimal final image: Only contains nginx + built assets (~50MB)
🔍 Observability
Health checks: Built-in health endpoint at /health
Proper signal handling: Uses dumb-init for graceful shutdowns
Structured logging: Nginx access and error logs
Quick Start
Build the Image
docker build -t dev-med-ivrit:latest .
Run the Container
docker run -d \
  --name dev-med-ivrit \
  -p 8080:8080 \
  --restart unless-stopped \
  dev-med-ivrit:latest
Access the application at: http://localhost:8080

Using Docker Compose
# Start the application
docker-compose up -d
# View logs
docker-compose logs -f
# Stop the application
docker-compose down
Build Stages Explained
Stage 1: Dependencies
Installs all npm dependencies
Separates production and development dependencies
Enables better caching when only code changes
Stage 2: Builder
Copies dependencies from Stage 1
Builds the production bundle
Runs Vite build process
Stage 3: Production
Uses minimal nginx:alpine image
Copies only built assets
Configures nginx with security headers
Runs as non-root user
Configuration
Environment Variables
The application is built at build-time, so environment variables need to be passed during build:

docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  -t dev-med-ivrit:latest .
Port Mapping
The container exposes port 8080. Map it to any host port:

# Map to port 80 on host
docker run -p 80:8080 dev-med-ivrit:latest
# Map to port 3000 on host
docker run -p 3000:8080 dev-med-ivrit:latest
Custom nginx Configuration
To override nginx configuration:

docker run -v $(pwd)/custom-nginx.conf:/etc/nginx/conf.d/default.conf dev-med-ivrit:latest
Production Deployment
Docker Swarm
docker stack deploy -c docker-compose.yml dev-med-ivrit
Kubernetes
Example deployment:

apiVersion: apps/v1
kind: Deployment
metadata:
  name: dev-med-ivrit
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dev-med-ivrit
  template:
    metadata:
      labels:
        app: dev-med-ivrit
    spec:
      containers:
      - name: web
        image: dev-med-ivrit:latest
        ports:
        - containerPort: 8080
        resources:
          limits:
            memory: "512Mi"
            cpu: "1000m"
          requests:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
Cloud Platforms
AWS ECS
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag dev-med-ivrit:latest <account>.dkr.ecr.us-east-1.amazonaws.com/dev-med-ivrit:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/dev-med-ivrit:latest
Google Cloud Run
# Push to GCR
docker tag dev-med-ivrit:latest gcr.io/<project-id>/dev-med-ivrit:latest
docker push gcr.io/<project-id>/dev-med-ivrit:latest
# Deploy
gcloud run deploy dev-med-ivrit \
  --image gcr.io/<project-id>/dev-med-ivrit:latest \
  --port 8080 \
  --platform managed
Azure Container Instances
# Push to ACR
az acr login --name <registry-name>
docker tag dev-med-ivrit:latest <registry-name>.azurecr.io/dev-med-ivrit:latest
docker push <registry-name>.azurecr.io/dev-med-ivrit:latest
Security Best Practices
1. Scan for Vulnerabilities
# Using Docker Scout
docker scout cves dev-med-ivrit:latest
# Using Trivy
trivy image dev-med-ivrit:latest
2. Content Security Policy
The nginx configuration includes a CSP header. Adjust it based on your needs in 
nginx.conf
:

add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..." always;
3. HTTPS Configuration
For production, use a reverse proxy (nginx, Traefik, Caddy) or cloud load balancer to handle HTTPS:

# Example reverse proxy config
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
Troubleshooting
Container Won't Start
Check logs:

docker logs dev-med-ivrit
Permission Issues
Ensure the non-root user has proper permissions:

docker exec -it dev-med-ivrit ls -la /usr/share/nginx/html
Build Failures
Clear Docker cache and rebuild:

docker build --no-cache -t dev-med-ivrit:latest .
Health Check Failing
Test the health endpoint:

docker exec -it dev-med-ivrit wget -O- http://localhost:8080/health
Optimization Tips
1. Use BuildKit
Enable Docker BuildKit for faster builds:

DOCKER_BUILDKIT=1 docker build -t dev-med-ivrit:latest .
2. Multi-platform Builds
Build for multiple architectures:

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t dev-med-ivrit:latest \
  --push .
3. Image Size
Check image size:

docker images dev-med-ivrit:latest
Analyze layers:

docker history dev-med-ivrit:latest
4. Cache Optimization
Use cache mounts for npm:

RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production
Monitoring
Resource Usage
# Real-time stats
docker stats dev-med-ivrit
# Inspect resource limits
docker inspect dev-med-ivrit | jq '.[0].HostConfig.Memory'
Logs
# Follow logs
docker logs -f dev-med-ivrit
# Last 100 lines
docker logs --tail 100 dev-med-ivrit
# Logs since timestamp
docker logs --since 2024-01-01T00:00:00 dev-med-ivrit
Maintenance
Update Base Images
Regularly update base images for security patches:

# Pull latest base images
docker pull node:20-alpine
docker pull nginx:1.27-alpine
# Rebuild
docker build -t dev-med-ivrit:latest .
Cleanup
# Remove unused images
docker image prune -a
# Remove stopped containers
docker container prune
# Full cleanup
docker system prune -a --volumes
Additional Resources
Docker Best Practices
nginx Security Headers
Container Security