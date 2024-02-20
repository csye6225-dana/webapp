packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = "~> 1"
    }
  }
}


source "googlecompute" "centos_stream_8" {
  project_id            = "csye6225-cloudcomputing"
  source_image_family   = "centos-stream-8"
  account_file          = "/Users/Dana_G/Documents/Code/NEU/CloudComputing/tf-gcp-infra/credentials.json"
  zone                  = "us-central1-a"
  ssh_username          = "root"
  image_name            = "webapp"
  image_description     = "Web server for portfolio web app."
  image_storage_locations = ["us-central1"]

  network               = "vpc-network1"
  subnetwork            = "webapp1"
  service_account_email = "829688566428-compute@developer.gserviceaccount.com"
}

build {
  sources = ["source.googlecompute.centos_stream_8"]

  provisioner "shell" {
    inline = [
      "mkdir -p /var/www/html",
      "cp -r /Users/Dana_G/Documents/Code/NEU/CloudComputing/webapp /var/www/html",  # Copy your Node.js application to the desired location
      "cd /var/www/html",
      "npm install",  # Install Node.js dependencies
      "npm install express sequelize dotenv mysql2 bcrypt basic-auth ci axios",
      "nohup node app.js &"  # Run the Node.js application in the background
    ]
  }
}
