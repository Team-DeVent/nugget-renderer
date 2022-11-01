# nugget-renderer
너겟 랜더링 컨테이너


## build
```
docker build --tag nuggetrenderer:0.1 .
```

## run
```
docker run -it \
-e URL=http:aaa.aaa \
-e UUID=0000-0000-0000-0000 \
-e VIRTUAL_HOST=uuid.nugget.testbed.devent.kr \
nuggetrenderer /bin/bash
```