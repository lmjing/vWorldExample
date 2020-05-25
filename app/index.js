angular.module('myApp')
    .controller('MapController', MapController);

function MapController($scope, $http) {

    let vmap;
    $scope.mode = 'background-map';

// 지도 ZOOM 설정
    $scope.setZoom = () => {
        let zoomLevel = document.getElementById("zoomLevel").value;
        vmap.getView().setZoom(zoomLevel);
    };

// 지도 포커싱
    $scope.moveToYeouido = function() {
        let _center = [14129709.590359, 4512313.7639686];
        vmap.getView().setCenter(_center);
        vmap.getView().setZoom(16);
        addMakrer();
    };

// 지도 zoom 객체 (컨트롤 UI)
    let makeZoomOption = () => {
        let zoom = new vw.ol3.control.Zoom(vmap);
        zoom.delta = 1; // 버튼이 클릭할 때 적용할 줌 델타
        zoom.sliderVisible = true; // 줌슬라이더 표현 여부

        /* vw.ol3.SiteAlignType = {
         NONE : "none",
         TOP_LEFT: "top-left",
         TOP_CENTER : "top-center",
         TOP_RIGHT : "top-right",
         CENTER_LEFT: "center-left",
         CENTER_CENTER: "center-center",
         CENTER_RIGHT : "center-right",
         BOTTOM_LEFT : "bottom-left",
         BOTTOM_CENTER : "bottom-center",
         BOTTOM_RIGHT : "bottom-right"
         }; */
        zoom.site = vw.ol3.SiteAlignType.CENTER_RIGHT;  // or   "center-right"
        zoom.draw();
        vmap.addControl(zoom);
    };

// 마커 추가
    let markerLayer;
    let addMakrer = (markerOption = {
        x: 126.92310000003624,
        y: 37.52620833012132,
        epsg: "EPSG:4326",
        title: '여의도',
        contents: '여의도 본문내용',
        iconUrl: 'http://map.vworld.kr/images/ol3/marker_blue.png',
        text: {
            offsetX: 0.5, //위치설정
            offsetY: 20,   //위치설정
            font: '12px Calibri,sans-serif',
            fill: {color: '#000'},
            stroke: {color: '#fff', width: 2},
            text: '여의도 마커'
        },
        attr: {"id": "maker01", "name": "속성명1"}
    }) => {
        if (!markerLayer) {
            markerLayer = new vw.ol3.layer.Marker(vmap);
            vmap.addLayer(markerLayer);
        }
        vw.ol3.markerOption = markerOption;
        markerLayer.addMarker(vw.ol3.markerOption);
    };

    $scope.getAddressKT = () => {
        let markerOption = {
            x: 127.027548,
            y: 37.497939,
            epsg: "EPSG:4326",
            title: '마커',
            contents: '주소 호출 실패',
            iconUrl: 'http://map.vworld.kr/images/ol3/marker_blue.png',
            text: {
                offsetX: 0.5, //위치설정
                offsetY: 20,   //위치설정
                font: '12px Calibri,sans-serif',
                fill: {color: '#000'},
                stroke: {color: '#fff', width: 2},
                text: '주소호출에 실패했습니다.'
            },
            attr: {"id": "maker", "name": "속성명"}
        };
        $http.get('http://api.vworld.kr/req/address', {
                params: {
                    service: 'address',
                    request: 'getAddress',
                    key: '38BBFD28-BE85-3C8A-944A-51A428E44141',
                    point: '127.0271674,37.4713571',
                    type: 'BOTH'
                }
        }).then(data => {
            let response = data.data.response;
            if (response.hasOwnProperty('error')) {
                markerOption.text.text = response.error.text;
                return;
            }
            let result = response.result;
            let input = response.input;
            if (result.size > 0 && result[0].text) {
                markerOption.x = input.point.x;
                markerOption.y = input.point.y;
                markerOption.contents = result[0].structure.level4L;
                markerOption.text.text = result[0].text;
            }
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            addMakrer(markerOption);
        });
    };

    $scope.setMode = function() {
        if ($scope.mode === '2d-map') {
            vw.ol3.MapOptions = {
                basemapType: vw.ol3.BasemapType.GRAPHIC
                , controlDensity: vw.ol3.DensityType.EMPTY
                , interactionDensity: vw.ol3.DensityType.BASIC
                , controlsAutoArrange: true
                , homePosition: vw.ol3.CameraPosition
                , initPosition: vw.ol3.CameraPosition
            };
            vmap = undefined;
            vmap = new vw.ol3.Map("vmap", vw.ol3.MapOptions);
            makeZoomOption();
        } else if ($scope.mode === 'background-map') {
            // TODO 여기 실행 안됨
            var options = {
                controls: [],
                projection: new OpenLayers.Projection("EPSG:900913"),
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                units: "m",
                controls: [],
                numZoomLevels:21,
                maxResolution: 156543.0339,
                maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
            };
            vmap = undefined;
            vmap = new OpenLayers.Map('vmap', options);

            vHybrid = new vworld.Layers.Hybrid('VHYBRID');
            if (vHybrid != null) {vmap.addLayer(vHybrid);}
        }
    };

    // avoid pink tiles
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    OpenLayers.Util.onImageLoadErrorColor = "transparent";
}
