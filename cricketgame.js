$(function() {
	function CricketGame(parent) {
		var API = {};
		API.points = ["25", "15", "16", "17", "18", "19", "20"];
		API.Hit = function(hitbox) {
			var API = {};
			API.is_player1 = function() {
				return hitbox.is('.player1');
			};
			API.opponent_hitbox = function() {
				var direction = this.is_player1(hitbox) ? 'next' : 'prev';
				return hitbox[direction]()[direction]();
			};
			API.hitbox_valuebox = function() {
				var direction = this.is_player1(hitbox) ? 'next' : 'prev';
				return hitbox[direction]();
			}
			API.hitbox_value = function() {
				return ~~this.hitbox_valuebox(hitbox).text();
			}
			API.opponent_hits = function() {
				return this.opponent_hitbox(hitbox).data('count');
			}
			API.player_hits = function() {
				return ~~hitbox.data('count');
			};
			API.is_closed_to_player = function() {
				return this.opponent_hits(hitbox) > 2;
			};
			API.is_open_to_player = function() {
				return this.player_hits(hitbox) > 2;
			};
			API.hitbox_point_marker = function() {
				return $('.point_marker', hitbox);
			}
			API.mark_hit = function() {
				var player_hits = this.player_hits(hitbox);
				this.hitbox_point_marker(hitbox).addClass('scored');
				if (player_hits == 2) {
					this.hitbox_point_marker(hitbox).text('X');
				} else if (player_hits == 1) {
					this.hitbox_point_marker(hitbox).text('/');
				}
			}
			API.open_value = function() {
				$('.point_marker', hitbox).text('X');
				if (this.is_closed_to_player(hitbox)) {
					this.hitbox_valuebox(hitbox).addClass('closed');
					$('.point_marker', hitbox).addClass('closed');
				} else {
					this.hitbox_valuebox(hitbox).css('color', '#FFF');
					$('.point_marker', hitbox).addClass('opened');
				}
			};
			API.add_points = function() {
				var totalbox = $('#totalboxes .' + (this.is_player1(hitbox) ? 'player1' : 'player2'));
				totalbox.text(~~totalbox.text() + this.hitbox_value(hitbox));
			};
			return API;
		}
		API.score = function(player) {
			return ~~$('#totalboxes .' + player).text();
		};
		API.player_winning = function(player) {
			var other_player = player == 'player1' ? 'player2' : 'player1';
			if (API.score(player) > API.score(other_player)) {
				return true;
			} else if (API.score(player) < API.score(other_player)) {
				return false;
			}
			return null;
		}
		API.nameboxes = function() {
			return $('<div />', {
				'id' : 'nameboxes'
			}).append(
				$('<div />' , {
					'class' : 'namebox player1',
					'contenteditable' : 'true',
					'text' : 'Player 1'
				})
			).append(
				$('<div />' , {
					'class' : 'namebox player2',
					'contenteditable' : 'true',
					'text' : 'Player 2'
				})
			);
		};
		API.size = function() {
			$('html').css('font-size', Math.round($(window).width() / 40) + 'px')
		}
		API.build_board = function() {
			var self = this;
			this.size();
			$(window).resize(API.size);
			parent
				.html('')
				.append(
					API.nameboxes()
				)
				.append(
					$('<div />', {
						'id' : 'scoreboard'
					}).append(
						$('<div />', {
							'id' : 'scorerows'
						}).html(
							(function(points) {
								return $(points).map(function(idx, pt) {
									return $('<span/>', {
										'class' : 'scorerow' 
									}).append(
										$('<span />', {
											'class' : 'hitbox player1',
											'click' : self.add_hit,
											'data-count' : '0',
											'html' : $('<span />', {
												'class': 'point_marker',
												'html' : ' &nbsp;'
											})
										})
									).append(
										$('<span />', {
											'class' : 'point_value',
											'text' : pt 
										})
									).append(
										$('<span />', {
											'class' : 'hitbox player2',
											'click' : self.add_hit,
											'data-count' : '0',
											'html' : $('<span />', {
												'class': 'point_marker',
												'html' : ' &nbsp;'
											})
										})
									)[0];
								});
							})(this.points)
						)
					).append(
						$('<div />', {
							'id' : 'totalboxes'
						}).append(
							$('<span />' , {
								'class' : 'totalbox player1',
								'contenteditable' : 'true',
								'text' : '0'
							})
						).append(
							$('<span />' , {
								'class' : 'totalbox player2',
								'contenteditable' : 'true',
								'text' : '0'
							})
						)
					)
				)
		}
		API.player1 = function() {
			return $('#nameboxes .player1').text();
		};
		API.player2 = function() {
			return $('#nameboxes .player2').text();
		};
		API.is_game_won = function(player) {
			 if ($('.scorerow .' + player).filter(function(idx, hitbox) {
					return !new API.Hit($(hitbox)).is_open_to_player();
				}).length === 0) {
				return API.player_winning(player);
			} else {
				return false;
			}
		};
		API.game_won = function(player) {
			$('#scoreboard')
				.append(
					$('<div />', {
						"class" : "player_won won_" + player,
						"text" : API[player]() + ' wins!'
					})
				)
			
		};
		API.add_hit = function(evt) {
			var hitbox = $(evt.currentTarget);
			var hit = new API.Hit(hitbox);
			if (hit.is_open_to_player()) {
				if (!hit.is_closed_to_player()) {
					hit.add_points();
				}
			} else {
				hit.mark_hit();
				if (hit.player_hits() == 2) {
					hit.open_value();
				}
				hitbox.data('count', hit.player_hits() + 1);
			}
			var player = 'player' + (hit.is_player1() ? '1' : '2');
			var other_player = 'player' + (hit.is_player1() ? '2' : '1');
			if (API.is_game_won(player)) {
				API.game_won(player);
			} else if (API.is_game_won(player) === null) {
				if (API.is_game_won(other_player) === null) {
					API.game_won(player);
					API.game_won(other_player);
				}
			}
		}
		return API;
	}
	var game = new CricketGame($("#wrapper"));
	game.build_board();
});