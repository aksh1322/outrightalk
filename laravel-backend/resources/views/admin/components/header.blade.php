<header id="page-topbar">
    <div class="navbar-header">
        <div class="d-flex">
            <!-- LOGO -->
            <div class="navbar-brand-box">
                <a href="{{ route('admin.home') }}" class="logo logo-dark">
                    <span class="logo-sm">
                        <img src="{{ asset('img/logo-light.png') }}" height="22" alt="ADMIN - {{ \Config::get('settings.company_name') }}"/>
                    </span>
                    <span class="logo-lg">
                        <img src="{{ asset('img/logo-light.png') }}" height="22" alt="ADMIN - {{ \Config::get('settings.company_name') }}"/>
                    </span>
                </a>

                <a href="{{ route('admin.home') }}" class="logo logo-light">
                    <span class="logo-sm">
                        <img src="{{ asset('img/logo-light.png') }}" height="22" alt="ADMIN - {{ \Config::get('settings.company_name') }}"/>
                    </span>
                    <span class="logo-lg">
                        <img src="{{ asset('img/logo-light.png') }}" height="22" alt="ADMIN - {{ \Config::get('settings.company_name') }}"/>
                    </span>
                </a>
            </div>

            <button type="button" class="btn btn-sm px-3 font-size-16 header-item waves-effect" id="vertical-menu-btn">
                <i class="fa fa-fw fa-bars"></i>
            </button>
        </div>

        <div class="d-flex">
            <div class="dropdown d-inline-block">
                <button type="button" class="btn header-item waves-effect" id="page-header-user-dropdown"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img class="rounded-circle header-profile-user" src="{{ auth()->user()->avatar['thumb'] }}"
                        alt="Header Avatar">
                    <span class="d-none d-xl-inline-block ml-1" key="t-{{ auth()->user()->first_name }}">{{ auth()->user()->full_name }}</span>
                    <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-right">
                    <!-- item-->
                    <a class="dropdown-item" href="{{ route('users.edit', auth()->user()->id) }}"><i class="bx bx-user font-size-16 align-middle mr-1"></i> <span key="t-profile">Profile</span></a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item text-danger" href="{{route('admin.logout')}}"><i class="bx bx-power-off font-size-16 align-middle mr-1 text-danger"></i> <span key="t-logout">Logout</span></a>
                </div>
            </div>
        </div>
    </div>
</header>