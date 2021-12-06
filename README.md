# 폴더구조 설명  
## project 폴더  
실제로 구현한 서버 프로젝트의 내용들이다.  
project/.env: 서버에서 사용할 환경변수들이 담겨있다.  
project/public: 정적 데이터들이 담겨있는 폴더이다.  
project/public/css: 프론트 화면에서 사용할 css 파일들을 모아놓은 폴더이다.  
project/public/js: 프론트 화면에서 사용할 js 파일들을 모아놓은 폴더이다.  
project/public/plugin: 부트스트랩, jQuery 등 라이브러리들이 저장된 폴더이다.  
  
project/src: node.js 서버의 각종 소스코드가 담겨있는 폴더이다.  
project/src/config: 서버에 대한 각종 설정들이 담겨있다.  
project/src/controllers: 클라이언트가 특정 URL에 요청을 했을때 처리할 로직들이 담겨있는 폴더이다.  
project/src/models: 주로 몽고DB에 저장하는 데이터의 형태가 담겨있는 폴더이다.  
project/src/services: 주로 비즈니스 로직이 담겨있는 폴더로, 컨트롤러에 로직을 몽땅 넣으면 코드가 복잡해지니 컨트롤러는 URL에 대한 처리만 담당하고 실제 로직은 services로 분할해서 구현후 컨트롤러에서 호출해서 사용한다.  
project/src/views/pages: 각종 페이지 구성을 담당할 프론트 화면이 담겨있는 폴더이다.  




## database 폴더  
몽고DB를 이용해 저장한 데이터들이 저장되는 공간이다.  




## utils 폴더  
세션 데이터를 저장하기 위한 redis와,  
각종 데이터를 저장하기 위한 MongoDB와,  
MongoDB를 백업하고 복구하는 등 다양한 기능을 지원하는 Mongo Tools등  
각종 프로그램이 저장되어 있다.  




## bat 파일들
redis.bat: 세션 데이터를 저장하기 위한 redis 서버를 실행한다.  
mongod.bat: 각종 데이터를 저장하기 위한 몽고DB 서버를 실행한다.  
mongodump.bat: 현재 데이터베이스에 저장된 내용들을 handaDBdump_랜덤숫자 형태의 폴더로 백업한다.  
mongorestore.bat: 몽고DB의 handaDB 데이터베이스를 백업해놨던 덤프 폴더로 복원한다. 실행하고 배치파일에서 덤프폴더의 이름을 입력해줘야한다. ex) handaDBdump_29954  

node.js의 express로 구현한 서버를 실행하기에 앞서서 redis와 mongod을 먼저 실행해줘야 한다!  