<nav class="navbar navbar-default">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="{{ url('/') }}">{{ \Config::get('settings.company_name') }}</a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <?php /*<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav navbar-right">
        @if (Route::has('login'))
            @auth
                <li><a href="{{ url('/') }}">Home</a></li>
                <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Account <span class="caret"></span></a>
                <ul class="dropdown-menu">
                    <li><a href="#">My Profile</a></li>
                    <li><a href="{{route('logout')}}">Logout</a></li>
                </ul>
                </li>
            @else
                <li><a href="{{ route('login') }}">Login</a></li>

                @if (Route::has('register'))
                    <li><a href="{{ route('register') }}">Register</a></li>
                @endif
            @endauth
        @endif
      </ul>
    </div><!-- /.navbar-collapse --> */?>
  </div><!-- /.container-fluid -->
</nav>