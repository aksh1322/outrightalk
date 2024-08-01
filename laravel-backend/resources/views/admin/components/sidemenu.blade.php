@php ($adminMenu = \App\Models\AdminMenu::getMenu() )
@php ($className  =  \App\Helpers\Helper::getController())

<!-- ========== Left Sidebar Start ========== -->
<div class="vertical-menu">

<div data-simplebar class="h-100">

    <!--- Sidemenu -->
    <div id="sidebar-menu">
        <!-- Left Menu Start -->
        <ul class="metismenu list-unstyled" id="side-menu">
            {{--<li class="menu-title" key="t-menu">Menu</li>--}}

            <li class="{{ ($className == 'DashboardController') ? 'active' : '' }}"><a href="{{ route('admin.home') }}" id="menu-home" class="waves-effect"><i class="bx bxs-dashboard"></i> Dashboard</a></li>
            @foreach($adminMenu as $key => $menu)
            <li class="{{ ($className == $menu['class']) ? 'active' : '' }}">
                @if($menu['child'])
                <a href="javascript:void(0);" class="menu-toggle waves-effect has-arrow">
                    <i class="{{ $menu['icon'] }}"></i>
                    <span>{{ $menu['menu'] }}</span>
                </a>
                <ul class="sub-menu" aria-expanded="false">
                    @foreach($menu['child'] as $k => $childMenu)
                        @if(Route::has($childMenu['url']))
                            <li class="{{ ($className == $childMenu['class']) ? 'active' : '' }}">
                                <a href="{{route($childMenu['url'], $childMenu['query_params'])}}" id="menu-{{ $childMenu['id'] }}" class="has-link"><span>{{ $childMenu['menu'] }}</span></a>
                            </li>
                        @endif
                    @endforeach
                </ul>
                @else
                    @if(Route::has($menu['url']))
                        <a href="{{route($menu['url'], $menu['query_params'])}}" id="menu-{{ $menu['id'] }}" class="has-link"><i class="{{ $menu['icon'] }}"></i> <span>{{ $menu['menu'] }}</span></a>
                    @endif
                @endif
            </li>
            @endforeach

        </ul>
    </div>
    <!-- Sidebar -->
</div>
</div>
<!-- Left Sidebar End -->