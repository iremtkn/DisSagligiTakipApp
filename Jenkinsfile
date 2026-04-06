pipeline {
    agent any

    stages {
        stage('Derleme') {
            steps {
                sh 'dotnet build'
            }
        }
        stage('Selenium Testi') {
            steps {
                sh 'dotnet test'
            }
        }
    }
}