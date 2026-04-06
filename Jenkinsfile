pipeline {
    agent any

    environment {
        DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = 'true'
    }

    tools {
        dotnetsdk 'dotnet8' 
    }

    stages {
        stage('Derleme (Build)') {
            steps {
                sh 'dotnet build .'
            }
        }
        stage('Selenium Testleri') {
            steps {
                sh 'dotnet test DisSagligiTakipApp.Tests/'
            }
        }
    }
}