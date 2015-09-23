$(document).ready(function() {
		$(".Download").eq(0).ElasticProgress({
				buttonSize: 60,
				fontFamily: "Montserrat",
				colorBg: "#adeca8",
				colorFg: "#7cc576",
				onClick: function(event) {
						console.log("onClick");
						$(this).ElasticProgress("open");
				},
				onOpen: function(event) {
						console.log("onOpen");
						fakeLoading($(this));
				},
				onComplete: function(event) {
						console.log("onComplete");
				},
				onClose: function(event) {
						console.log("onClose");
				},
				onFail: function(event) {
						console.log("onFail");
						$(this).ElasticProgress("open");
				},
				onCancel: function(event) {
						console.log("onCancel");
						$(this).ElasticProgress("open");
				}
		});

		$(".Download").eq(1).ElasticProgress({
				align: "center",
				fontFamily: "Roboto",
				colorFg: "#77c2ff",
				colorBg: "#4e80dd",
				bleedTop: 110,
				bleedBottom: 40,
				buttonSize: 100,
				labelTilt: 70,
				arrowDirection: "up",
				onClick: function() {
						$(this).ElasticProgress("open");
						//$(this).ElasticProgress("close");
				},
				onOpen: function() {
						fakeLoading($(this))
				},
				onCancel: function() {
						$(this).ElasticProgress("close");
				},
				onComplete: function() {
						var $obj = $(this)

						$obj.ElasticProgress("close");
				}
		});

		$(".Download").eq(2).ElasticProgress({
				align: "center",
				colorFg: "#686e85",
				colorBg: "#b4bad2",
				highlightColor: "#ffab91",
				width: Math.min($(window).width()/2 - 100, 600),
				barHeight: 10,
				labelHeight: 50,
				labelWobbliness: 0,
				bleedTop: 120,
				bleedRight: 100,
				buttonSize: 60,
				fontFamily: "Arvo",
				barStretch: 0,
				barInset: 4,
				barElasticOvershoot: 1,
				barElasticPeriod: 0.6,
				textFail: "Download Failed",
				textComplete: "Download Complete",
				arrowHangOnFail: false,
				onClick: function() {
						$(this).ElasticProgress("open");
				},
				onOpen: function() {
						fakeLoading($(this))
				},
				onComplete: function() {
						var $obj = $(this)

						TweenMax.delayedCall(1.5, function() {
								$obj.ElasticProgress("close");
						})
				}
		});

		var e = new ElasticProgress(document.querySelectorAll('.Download')[3], {
				colorFg: "#ed7499",
				colorBg: "#635c73",
				highlightColor: "#ed7499",
				barHeight: 14,
				barInset: 10,
				fontFamily: "Indie Flower"
		});
		e.onClick(function() {
				e.open();
		})
		e.onOpen(function() {
				fakeLoading(e, 2, 0.5);
		});
		e.onFail(function() {
				e.close();
		})

		function fakeLoading($obj, speed, failAt) {
				if (typeof speed == "undefined") speed = 2;
				if (typeof failAt == "undefined") failAt = -1;
				var v = 0;
				var l = function() {
						if (failAt > -1) {
								if (v >= failAt) {
										if (typeof $obj.jquery != "undefined") {
												$obj.ElasticProgress("fail");
										} else {
												$obj.fail();
										}
										return;
								}
						}
						v += Math.pow(Math.random(), 2) * 0.1 * speed;

						if (typeof $obj.jquery != "undefined") {
								$obj.ElasticProgress("setValue", v);
						} else {
								$obj.setValue(v);
						}
						if (v < 1) {
								TweenMax.delayedCall(0.05 + (Math.random() * 0.14), l)
						}
				};
				l();
		}
});
