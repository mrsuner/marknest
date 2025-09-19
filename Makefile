# Marknest Docker Makefile
.PHONY: help build up down clean logs shell

# Default target
help:
	@echo "Available commands:"
	@echo "  build  - Build the Docker image"
	@echo "  up     - Run docker-compose up"
	@echo "  down   - Run docker-compose down"
	@echo "  clean  - Clean Docker containers and volumes"
	@echo "  logs   - View logs from all services"
	@echo "  shell  - Open shell in the app container"

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