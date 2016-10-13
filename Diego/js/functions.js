$(function(){
	var base = $('.base').attr('id');

	function hidemessage(div){
		setTimeout(function(){
			$(div).find('div').fadeOut();
		}, 3000);
	}

	$('body').on('click', '.cad_btn', function(e){
		e.preventDefault();
		$('#cadastrar').animate({marginLeft:'+='+550}, 200);
		$(this).removeClass('cad_btn');
		return false;
	});

	$('.close').on('click', function(){
		$('#cadastrar').animate({marginLeft:'-='+550}, 200);
		$('.cadastre_se').addClass('cad_btn');
	});

	$('.button_aba').on('click', function(e){
		e.preventDefault();
		var abrir = $(this).attr('id');
		$('.button_aba').removeClass('ativo');
		$(this).addClass('ativo');

		$('.aba').hide();
		$('.aba.'+abrir).show();

		$.ajax({
			method: 'POST',
			url: base+'/sys/muda_aba.php',
			data: {aba: abrir},
			success: function(r){}
		});
		return false;
	});

	function limitaCaracteres(textarea, counter, limit){
		$('.'+counter).text(limit+' restantes');
		var left;
		$('.'+textarea).on('keyup', function(e){
			var qtdCaracteres = $(this).val().length;
			left = limit-qtdCaracteres;
			if(left <= 0){
				left = 0;
				var textoAtual = $(this).val();
				var novoTexto = '';
				for(var n = 0; n < limit; n++){
					novoTexto += textoAtual[n];
				}
				$(this).val(novoTexto);
			}
			$('.'+counter).text(left+' restantes');
		});
	}
	limitaCaracteres('msg', 'counter', 300);
	limitaCaracteres('desc_limit', 'desccount', 200);

	$('.send_message').on('click', function(e){
		e.preventDefault();
		var texto_digitado = $('.msg').val();
		if(texto_digitado == ''){
			alert('Informe um texto para o seu tweet');
		}else{
			$.ajax({
				method: 'POST',
				url: 'sys/tweetar.php',
				data: {tweet: texto_digitado},
				dataType: 'json',
				success: function(retorno){
					 /*
						retorno.nome
						retorno.tweet
						retorno.date
						retorno.status
					 */

					 if(retorno.status == 'ok'){
					 	$('.msg').val('');
					 	
					 	var tweet = '<article class="tweet hidden">';
					 		tweet += '<span class="nome"><a href="#">'+retorno.nome+'</a> disse:</span>';
							tweet += '<p>'+retorno.tweet+'</p>';
							tweet += '<span class="date">'+retorno.date+'</span></article>';

						$('#content').prepend(tweet);
						$('#content .tweet.hidden').slideDown().promise().done(function(){
							$(this).removeClass('hidden');
						});
					 }else{
					 	alert('ocorreu um erro ao enviar seu tweet');
					 }
				}
			});
		}

		return false;
	});

	$('#logar').on('click', function(e){
		e.preventDefault();
		var login = $('input[name=login]').val();
		var senha = $('input[name=senha]').val();
		if(login == '' || senha == ''){
			$('.retorno_log').html('<div class="aviso yellow">Preencha todos os campos</div>');
			hidemessage('.retorno_log');
		}else{
			$.ajax({
				method: 'POST',
				url: 'sys/logar.php',
				data: {login:login, senha:senha},
				dataType: 'json',
				success:function(retorno){
					//console.log(retorno);
					if(retorno.status == 'ok'){
						localStorage.setItem('user_id', retorno.user_id);
						location.reload();
					}else{
						$('.retorno_log').html('<div class="aviso yellow">Ocorreu um erro ao tentar logar, ou login e senha não encontrados</div>');
						hidemessage('.retorno_log');
					}
				}
			});
		}
		return false;
	});

	$('body').on('click', '.seguir', function(e){
		e.preventDefault();
		var elemento = $(this);
		var usuario = $(this).attr('data-user');
		var texto = $(this).text();

		$(this).html('<span class="icon-user"></span> aguarde...').removeClass('seguir');
		$.ajax({
			method: 'POST', 
			url: base+'/sys/follows.php',
			data: {follow_unfollow: usuario},
			success: function(retorno){
				console.log(retorno);
				if(retorno == 'ok'){
					if(texto == 'Desseguir' || texto == ' Desseguir'){
						elemento.html('<span class="icon-user"></span> Seguir');
						elemento.addClass('seguir');
					}else{
						elemento.html('<span class="icon-user"></span> Desseguir');
						elemento.addClass('seguir');
					}
				}else{	
					alert('Ocorreu um erro, por favor, tente mais tarde!');
				}
			},
			error: function(){
				alert('Ocorreu um erro, por favor, tente mais tarde!');
			}
		});
		return false;
	});

	//código para o cadastro
	$('#efetuar_cadastro, #editar_perfil').on('click', function(e){
		e.preventDefault();
		var nome = $('#nome').val();
		var email = $('#email').val();
		var nickname = $('#nickname').val();
		var senha = $('#senha').val();
		var descricao = $('#descricao').val();
		var acao = $(this).attr('id');

		if(nome == '' || email == '' || nickname == '' || senha == '' || descricao == ''){
			$('.retorno_cadastro').html('<div class="aviso yellow">Preencha todos os campos</div>');
			hidemessage('.retorno_cadastro');
		}else{
			$.ajax({
				method: 'POST',
				url: 'sys/edita_cadastra.php',
				data:{acao: acao, nome:nome, email:email, nickname:nickname, senha:senha, descricao:descricao},
				success:function(retorno){
					if(retorno == 'nickname'){
						$('.retorno_cadastro').html('<div class="aviso yellow">O nickname informado já está sendo utilizado por outra conta!</div>');
					}else if(retorno == 'email'){
						$('.retorno_cadastro').html('<div class="aviso yellow">Já existe uma conta cadastrada utilizando este e-mail!</div>');
					}else if(retorno == 'ok'){
						if(acao == 'efetuar_cadastro'){
							$('.retorno_cadastro').html('<div class="aviso green">Cadastro realizado com sucesso</div>');
						}else if(acao == 'editar_perfil'){
							$('.retorno_cadastro').html('<div class="aviso green">Dados editados com sucesso!</div>');
						}
						$('#cadastrar textarea').val('');
						$('#cadastrar input[type=password]').val('');
						$('#cadastrar input[type=text]').each(function(){
							$(this).val('');
						});
					}else{
						if(acao == 'efetuar_cadastro'){
							$('.retorno_cadastro').html('<div class="aviso yellow">Houve um problema no cadastro, tente mais tarde!</div>');
						}else if(acao == 'editar_perfil'){
							$('.retorno_cadastro').html('<div class="aviso yellow">Houve um problema na edição de perfil, tente mais tarde!</div>');
						}
					}
					hidemessage('.retorno_cadastro');
				},
				error: function(){
					$('.retorno_cadastro').html('<div class="aviso yellow">Houve um erro na comunicação com o servidor, tente mais tarde!</div>');
					hidemessage('.retorno_cadastro');
				}
			});
		}
		return false;
	});
	
	$('body').on('click', '.load_more', function(e){
		e.preventDefault();
		var type = $(this).attr('id');
		var id_user = '';
		var hashtag = '';
		var data_search = '';
		if(type == 'tweets_timeline'){
			id_user = $(this).attr('data-id');
		}
		if(type == 'perfis_busca'){
			data_search = $(this).attr('data-search');
		}
		
		if(type == 'tweets_hashtag'){
			hashtag = $(this).attr('data-tag');
		}
		$.ajax({
			method:'POST',
			url: base+'/sys/load_more.php',
			data: {tipo: type, user_id: id_user, data_search: data_search, hashtag: hashtag},
			dataType: 'json',
			success: function(retorno){
				if(retorno.load_more == 'nao'){
					$('.load_more').hide();
				}
				/*
					retorno.nome
					retorno.tweet
					retorno.date
					retorno.status
				 */
				 if(type == 'tweets_home' || type == 'tweets_timeline' || type == 'tweets_hashtag'){

				 	$.each(retorno.results, function(i, val){

				 		var tweet = '<article class="tweet">';
					 		tweet += '<span class="nome"><a href="'+base+'/'+retorno.results[i].nickname+'">'+retorno.results[i].nome+'</a> disse:</span>';
							tweet += '<p>'+retorno.results[i].tweet+'</p>';
							tweet += '<span class="date">'+retorno.results[i].date+'</span></article>';
						$('.content_tweets').append(tweet);
				 	});
				 }else if(type == 'perfis_busca'){
				 	$.each(retorno.results, function(i, val){
				 		var dados = retorno.results[i];
				 		var perfil = '<div class="box_perfil"><div class="img"><img src="'+dados.foto+'" /></div>';
							perfil += '<div class="fix">';
							perfil += '<a href="#" class="button seguir" data-user="'+dados.id+'"><span class="icon-user"></span> '+dados.texto+'</a>';
							perfil += '</div><span class="perfil_nick">';
							perfil += '<span><a href="'+base+'/'+dados.nickname+'">'+dados.nome+'</a></span>';
							perfil += '<p><a href="'+base+'/'+dados.nickname+'">@'+dados.nickname+'</a></p>';
							perfil += '</span><div class="desc"><p>'+dados.descricao+'</p></div></div>';

						$('.content_perfis').append(perfil);
				 	});
				 }
			}
		});
		return false;
	});
	$('#target').Jcrop({
		aspectRatio: 1,
		minSize: [160,160],
		setSelect: [0,0,160,160],
		onChange: showCoords,
		onSelect: showCoords
	});

	function showCoords(c){
		$('#x').val(c.x);
		$('#y').val(c.y);
		$('#w').val(c.w);
		$('#h').val(c.h);
	};
});

