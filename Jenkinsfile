pipeline {

 

    agent any

 

    environment {

 

        SERVER = "root@reactsrv"

 

        SSH_OPTS = "-o StrictHostKeyChecking=no -i /root/.ssh/jenkins_prod"

 

        APP_DIR = "/var/www/html/happy-hospital-frontend"

 

        SERVICE_NAME = "happy-hospital-frontend.service"

 

        REPO = "git@192.168.0.13:webdev/happy-hospital/happy-hospital-frontend.git"

 

        BRANCH = "main"

    }

 

    stages {

 

        stage('Deploy') {

 

            steps {

 

                sh '''

                set -e

 

                echo "Starting deployment..."

 

                ssh ${SSH_OPTS} ${SERVER} << 'EOF'

 

                set -e

 

                APP_DIR=/var/www/html/happy-hospital-frontend

 

                RELEASE_DIR=$APP_DIR/releases

 

                CURRENT=$APP_DIR/current

 

                SERVICE_NAME=happy-hospital-frontend.service

 

                TIMESTAMP=$(date +%Y%m%d_%H%M%S)

 

                NEW_RELEASE=$RELEASE_DIR/$TIMESTAMP

 

                PREVIOUS_RELEASE=$(readlink -f $CURRENT || true)

 

                echo "Creating release directory..."

                mkdir -p $RELEASE_DIR

 

                echo "Cloning repository..."

                git clone -b main git@192.168.0.13:webdev/happy-hospital/happy-hospital-frontend.git $NEW_RELEASE

 

                cd $NEW_RELEASE

 

                echo "Installing dependencies..."

                npm install

 

                echo "Building application..."

                npm run build

 

                echo "Validating build..."

 

                if [ ! -d ".next" ]; then

                    echo "Build failed"

                    exit 1

                fi

 

                echo "Switching to new release..."

                ln -sfn $NEW_RELEASE ${CURRENT}_tmp

                mv -Tf ${CURRENT}_tmp $CURRENT

 

                echo "Restarting service..."

                systemctl restart $SERVICE_NAME

 

                echo "Waiting for service..."

                sleep 5

 

                if systemctl is-active --quiet $SERVICE_NAME; then

 

                    echo "Service started successfully"

 

                else

 

                    echo "Service failed"

                    echo "Rolling back..."

 

                    ln -sfn $PREVIOUS_RELEASE ${CURRENT}_tmp

                    mv -Tf ${CURRENT}_tmp $CURRENT

 

                    systemctl restart $SERVICE_NAME

 

                    journalctl -u $SERVICE_NAME -n 50 --no-pager

 

                    exit 1

                fi

 

                echo "Cleaning old releases..."

                ls -dt $RELEASE_DIR/* 2>/dev/null | tail -n +4 | xargs -r rm -rf

 

                echo "Deployment completed successfully"

 

EOF

                '''

            }

        }

    }

 

    post {

 

        success {

            echo 'Deployment Success'

        }

 

        failure {

            echo 'Deployment Failed'

        }

    }

}