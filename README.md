# nugget-renderer
너겟 랜더링 컨테이너


## build
```
docker build --tag nuggetrenderer:0.1 .
```

## run
```
docker run -it \
-v <host_asset_dir>:/app/data \
-v <host_dir>/<project_UUID>:/app/config \
nuggetrenderer /bin/bash
```