pipeline {
    agent any
    environment { DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = 'true' }
    tools { dotnetsdk 'dotnet-sdk' }
    stages {
        stage('Proje Derleme (Build)') {
            steps {
                dir('DisSagligiTakipApp.API') {
                    sh 'dotnet build'
                }
                echo 'TEBRIKLER IREM! Proje basariyla derlendi.'
            }
        }
    }
}