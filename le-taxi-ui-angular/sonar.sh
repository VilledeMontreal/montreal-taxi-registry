sonar-scanner -Dsonar.branch.name=`git branch | grep \\* | cut -d ' ' -f2` -Dsonar.branch.target=`echo develop`
exit