packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1.0.0"
    }
  }
}

source "googlecompute" "centos_stream_8" {
  project_id            = "cloudcomputing-415019"
  source_image_family   = "centos-stream-8"
  zone                  = "us-central1-a"
  ssh_username          = "centos"
  image_name            = "centos-stream-8-custom11"
  image_description     = "Custom image based on CentOS Stream 8."
  image_family          = "centos-stream-8"
  network               = "default"
  tags                  = ["http-server"]
  credentials_file      = "credentials.json"
}

build {
  sources = ["source.googlecompute.centos_stream_8"]

  # Cleanup any existing node_modules directory
  provisioner "shell" {
    inline = [
      "rm -rf /tmp/webapp/node_modules"
    ]
  }
  provisioner "file" {
    source      =  "/Users/Dana_G/Downloads/webapp-04"
    destination = "/tmp/webapp"
  }

  provisioner "shell" {
    inline = [
      "cd /tmp/webapp",
      "sudo yum install -y mysql-server",
      "sudo systemctl start mysqld",
      "sudo systemctl enable mysqld",
      "sudo systemctl status mysqld",  # Verify MySQL service status
      "if ! sudo mysql -e 'SELECT 1 FROM mysql.user WHERE User = \"root\"' | grep -q 1; then",
      "  sudo mysql -e \"CREATE USER 'root'@'localhost' IDENTIFIED BY '1234567890';\"",
      "  sudo mysql -e \"GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;\"",
      "  sudo mysql -e \"FLUSH PRIVILEGES;\"",
      "else",
      "  sudo mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED BY '1234567890';\"",
      "fi",

      "sudo yum install -y nodejs npm",  # Install Node.js and npm
      "npm init -y", # Create package.json with defaults
      "npm install --force express sequelize dotenv mysql2 bcrypt basic-auth ci axios"  # Install Node.js dependencies
    ]
  }


}
