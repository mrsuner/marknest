# Marknest Docker Makefile
.PHONY: help build up down clean logs shell build-release push-image prod-up prod-down

# Configuration
DOCKER_IMAGE_NAME ?= marknest-app
DOCKER_IMAGE_TAG ?= latest
DOCKER_REGISTRY ?= docker.io
DOCKER_USERNAME ?= yourusername

# Default target
help:
	@echo "Available commands:"
	@echo "  build         - Build the Docker image for development"
	@echo "  up            - Run docker-compose up for development"
	@echo "  down          - Run docker-compose down for development"
	@echo "  clean         - Clean Docker containers and volumes"
	@echo "  logs          - View logs from all services"
	@echo "  shell         - Open shell in the app container"
	@echo "  build-release - Build production Docker image"
	@echo "  push-image    - Push Docker image to registry"
	@echo "  prod-up       - Run production docker-compose"
	@echo "  prod-down     - Stop production docker-compose"

# Build the Docker image
build:
	docker-compose build --no-cache

# Run docker-compose up
up:
	docker-compose up --build

# Run docker-compose down
down:
	docker-compose down

# Clean Docker containers and volumes
clean:
	docker-compose down -v --remove-orphans

# View logs from all services
logs:
	docker-compose logs -f

# Open shell in the app container
shell:
	docker-compose exec app bash

# Production Commands

# Build production Docker image
build-release:
	@echo "Building production image: $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)"
	docker build -f docker/Dockerfile -t $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG) .
	docker tag $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG) $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):latest
	@echo "Built image: $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)"

# Push Docker image to registry
push-image:
	@echo "Pushing image: $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)"
	docker push $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):latest
	@echo "Pushed image: $(DOCKER_REGISTRY)/$(DOCKER_USERNAME)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)"

# Run production docker-compose
prod-up:
	docker-compose -f docker-compose.prod.yml up -d

# Stop production docker-compose
prod-down:
	docker-compose -f docker-compose.prod.yml down