(function(){
  /* ACCORDION */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click',function(){
      var item=this.closest('.faq-item');
      var answer=item.querySelector('.faq-a');
      var isOpen=item.classList.contains('open');
      /* close all */
      document.querySelectorAll('.faq-item.open').forEach(function(i){
        i.classList.remove('open');
        i.querySelector('.faq-a').style.maxHeight='0';
      });
      if(!isOpen){
        item.classList.add('open');
        answer.style.maxHeight=answer.scrollHeight+'px';
      }
    });
  });

  /* SEARCH */
  var searchInput=document.getElementById('faqSearch');
  var noResults=document.getElementById('faqNoResults');
  searchInput.addEventListener('input',function(){
    var q=this.value.trim().toLowerCase();
    var anyVisible=false;
    document.querySelectorAll('.faq-item').forEach(function(item){
      var text=item.textContent.toLowerCase();
      var match=!q||text.indexOf(q)!==-1;
      item.style.display=match?'':'none';
      if(match)anyVisible=true;
    });
    document.querySelectorAll('.faq-category').forEach(function(cat){
      var visible=Array.from(cat.querySelectorAll('.faq-item')).some(function(i){return i.style.display!=='none';});
      cat.style.display=visible?'':'none';
    });
    noResults.style.display=anyVisible?'none':'block';
  });

  /* SIDEBAR ACTIVE STATE */
  var sidebarLinks=document.querySelectorAll('.faq-sidebar__link');
  var categories=document.querySelectorAll('.faq-category');
  function onScroll(){
    var scrollY=window.scrollY+120;
    categories.forEach(function(cat){
      var top=cat.offsetTop, bottom=top+cat.offsetHeight;
      if(scrollY>=top&&scrollY<bottom){
        var id=cat.id;
        sidebarLinks.forEach(function(l){l.classList.toggle('active',l.dataset.target===id);});
      }
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  /* SCROLL FADE-UP */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target);}
    });
  },{threshold:0.08});
  document.querySelectorAll('.fade-up').forEach(function(el){io.observe(el);});
})();