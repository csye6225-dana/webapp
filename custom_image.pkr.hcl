packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = "~> 1"
    }
  }
}

source "googlecompute" "custom_image" {
  project_id      = var.project_id
  source_image_family = "centos-8"
  image_name      = "custom-image"
  image_family    = "custom-image-family"
  zone            = "us-central1-a"
  ssh_username    = "ubuntu"
  private_key_file = var.private_key_file
  communicator    = "ssh"

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y mysql-server",
      "sudo apt-get install -y nodejs npm",
      "sudo npm install -g express sequelize-cli",
      "sudo npm install -g axios",
      "sudo npm install express sequelize dotenv mysql2 bcrypt basic-auth ci"
    ]
  }

  provisioner "local-exec" {
    command = "gcloud auth activate-service-account --key-file=${var.private_key_file}"
  }

  provisioner "local-exec" {
    command = "gcloud compute instances stop custom-image --zone=us-central1-a"
  }
}

build {
  sources = [
    "source.googlecompute.custom_image"
  ]
}