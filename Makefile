# Marknest Production Makefile
.PHONY: help build push up down logs shell

# Configuration
DOCKER_IMAGE ?= ghcr.io/mrsuner/marknest-backend
DOCKER_IMAGE_TAG ?= latest
DOCKER_PLATFORMS ?= linux/amd64,linux/arm64

# Default target
help:
	@echo "Available commands:"
	@echo "  build  - Build the production Docker image"
	@echo "  push   - Push Docker image to registry"
	@echo "  up     - Start production services"
	@echo "  down   - Stop production services"
	@echo "  logs   - View logs from all services"
	@echo "  shell  - Open shell in the app container"

# Build production Docker image (multi-platform)
build:
	docker buildx build --platform $(DOCKER_PLATFORMS) -f infra/Dockerfile -t $(DOCKER_IMAGE):$(DOCKER_IMAGE_TAG) .

# Push Docker image to registry
push:
	docker push $(DOCKER_IMAGE):$(DOCKER_IMAGE_TAG)

# Start production services
up:
	docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.docker up -d

# Stop production services
down:
	docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.docker down

# View logs from all services
logs:
	docker compose -f infra/docker-compose.prod.yml logs -f

# Open shell in the app container
shell:
	docker compose -f infra/docker-compose.prod.yml exec app bash
