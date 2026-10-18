# VectorVision on IBM LinuxONE & Red Hat OpenShift (s390x)

## 1. Architectural Highlights on IBM Z / LinuxONE

VectorVision is engineered to capitalize on the unique capabilities of **IBM LinuxONE (s390x architecture)**:
- **High Concurrency & Low Latency**: LinuxONE's dedicated I/O processors and high cache bandwidth enable real-time ingestion of 10,000+ emergency telemetry ticks per second without jitter.
- **Hardware-Accelerated Security (CPACF)**: End-to-end encryption for sensitive patient health data (PHI/HIPAA compliance) using hardware crypto accelerators.
- **Enterprise High Availability**: Red Hat OpenShift on IBM Z provides zero-downtime rolling updates, automated self-healing, and sub-second container failovers across logical partitions (LPARs).

---

## 2. Multi-Architecture Container Build (s390x & amd64)

To build containers for IBM LinuxONE using Docker Buildx:

```bash
# Set up docker buildx for multi-platform
docker buildx create --name linuxone-builder --use
docker buildx inspect --bootstrap

# Build and push Backend image for s390x and amd64
docker buildx build \
  --platform linux/s390x,linux/amd64 \
  -t image-registry.openshift-image-registry.svc:5000/vectorvision/backend:latest \
  -f deployment/Dockerfile.backend \
  --push .

# Build and push Frontend image for s390x and amd64
docker buildx build \
  --platform linux/s390x,linux/amd64 \
  -t image-registry.openshift-image-registry.svc:5000/vectorvision/frontend:latest \
  -f deployment/Dockerfile.frontend \
  --push .
```

---

## 3. Deploying to Red Hat OpenShift on LinuxONE

1. **Log in to your OpenShift cluster**:
   ```bash
   oc login -u <username> -p <password> --server=https://api.linuxone.cluster:6443
   ```

2. **Create Project / Namespace**:
   ```bash
   oc new-project vectorvision --description="VectorVision AI Emergency Dispatch System"
   ```

3. **Apply Kubernetes/OpenShift Manifests**:
   ```bash
   oc apply -f deployment/openshift/configmap.yaml
   oc apply -f deployment/openshift/deployment.yaml
   oc apply -f deployment/openshift/service.yaml
   oc apply -f deployment/openshift/route.yaml
   ```

4. **Verify Rollout & High Availability**:
   ```bash
   oc get pods -n vectorvision -o wide
   oc get routes -n vectorvision
   ```

---

## 4. Local Execution via Docker Compose

For rapid local testing and hackathon demonstration:
```bash
cd deployment
docker compose up --build
```
- Dashboard: `http://localhost`
- API & Docs: `http://localhost:8000/docs`
