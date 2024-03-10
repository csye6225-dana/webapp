packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1.0.0"
    }
  }
}

variable "project_id" {
  type        = string
  description = "The GCP project ID."
}

variable "source_image_family" {
  type        = string
  description = "The source image family for the GCP instance."
}

variable "zone" {
  type        = string
  description = "The GCP zone where the instance will be created."
}

variable "ssh_username" {
  type        = string
  description = "Username for SSH access."
}

variable "image_name" {
  type        = string
  description = "The name of the output custom image."
}

variable "image_description" {
  type        = string
  description = "Description for the custom image."
}

variable "image_family" {
  type        = string
  description = "The family of the custom image."
}

variable "network" {
  type        = string
  description = "The network where the GCP instance will be connected."
}

variable "tags" {
  type        = list(string)
  description = "A list of tags to apply to the instance."
}

variable "credentials_file" {
  type        = string
  description = "Path to the GCP credentials file."
}

variable "source" {
  type        = string
  description = "Source file or directory for file provisioner."
}

variable "destination" {
  type        = string
  description = "Destination path for file provisioner."
}

variable "app_location" {
  type        = string
  description = "Path to the application folder in image."
}

source "googlecompute" "centos_stream_8" {
  project_id          = var.project_id
  source_image_family = var.source_image_family
  zone                = var.zone
  ssh_username        = var.ssh_username
  image_name          = var.image_name
  image_description   = var.image_description
  image_family        = var.image_family
  network             = var.network
  tags                = var.tags
  credentials_file    = var.credentials_file
}

build {
  sources = ["source.googlecompute.centos_stream_8"]

  provisioner "file" {
    source      = var.source
    destination = var.destination # Destination folder in the image
  }

  provisioner "shell" {
    inline = [
      "set -e",
      "sudo groupadd -f csye6225",
      "sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225",
      "sudo yum install -y unzip",
      "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash",
      "nvm install 18.17.0",
      "nvm use 18.17.0",
      "sudo yum install -y nodejs",
      "sudo mkdir -p ${var.app_location}",
      "sudo chown -R csye6225:csye6225 ${var.app_location}",
      "sudo unzip -o ${var.destination} -d ${var.app_location}",
      "sudo cp ${var.app_location}/webapp.service /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service" # Assuming you want to enable the service
    ]
  }
}
