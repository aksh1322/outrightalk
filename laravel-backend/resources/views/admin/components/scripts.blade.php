<script src="{{ asset('/administrator/assets/libs/jquery/jquery.min.js')}}"></script>
<script src="{{ asset('/administrator/assets/libs/bootstrap/js/bootstrap.bundle.min.js')}}"></script>

<script src="{{ asset('/administrator/assets/libs/simplebar/simplebar.min.js')}}"></script>
<script src="{{ asset('/administrator/assets/libs/node-waves/waves.min.js')}}"></script>

<script src="{{ asset('/administrator/assets/libs/metismenu/metisMenu.min.js')}}"></script>
<script src="{{ asset('/administrator/assets/js/app.js')}}"></script>
<!-- toastr plugin -->
<script src="{{ asset('/administrator/assets/libs/toastr/build/toastr.min.js') }}"></script>

<!-- Sweet Alerts js -->
<script src="{{ asset('/administrator/assets/libs/sweetalert2/sweetalert2.min.js') }}"></script>

<script src="{{ asset('/administrator/admin-form-plugins/app.js')}}"></script>

<!-- Select Plugin Js -->
<script src="{{ asset('/administrator/admin-form-plugins/bootstrap-select/js/bootstrap-select.js')}}"></script>

@if(\App\Helpers\Helper::getController() == 'StickerController')
<script src="{{ asset('/administrator/assets/js/sticker.js')}}"></script>
@elseif(\App\Helpers\Helper::getController() == 'StickerCategoryController')
<script src="{{ asset('/administrator/assets/js/stickercategory.js')}}"></script>
@endif

@stack('page_script')