pipeline {
    agent any

    environment {
        DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = 'true'
    }

    tools {
        dotnetsdk 'dotnet-sdk' 
    }

    stages {
        stage('Derleme (Build)') {
            steps {
                dir('DisSagligiTakipApp.API') {
                    sh 'dotnet build'
                }
            }
        }
        stage('Selenium Testleri') {
            steps {
                dir('DisSagligiTakipApp.Tests') {
                    sh 'dotnet test'
                }
            }
        }
    }
}