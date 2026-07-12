pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "abdullahahmed1101076/dataflow-frontend"
        BACKEND_IMAGE = "abdullahahmed1101076/dataflow-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                sh """
                docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                """
            }
        }

        stage('Build Backend') {
            steps {
                sh """
                docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                """
            }
        }
    }
}
