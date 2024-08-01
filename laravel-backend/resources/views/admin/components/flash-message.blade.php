@if ($message = Session::get('success'))
@push('page_script')
<script type="text/javascript">
	showNotification('success', '{{ $message }}', 'top', 'right', 'animated rotateInUpRight', 'animated rotateOutUpRight');
</script>
@endpush
@endif


@if ($message = Session::get('error'))
@push('page_script')
<script type="text/javascript">
	showNotification('error', '{{ $message }}', 'top', 'right', 'animated rotateInUpRight', 'animated rotateOutUpRight');
</script>
@endpush
@endif


@if ($message = Session::get('warning'))
@push('page_script')
<script type="text/javascript">
	showNotification('warning', '{{ $message }}', 'top', 'right', 'animated rotateInUpRight', 'animated rotateOutUpRight');
</script>
@endpush
@endif


@if ($message = Session::get('info'))
@push('page_script')
<script type="text/javascript">
	showNotification('info', '{{ $message }}', 'top', 'right', 'animated rotateInUpRight', 'animated rotateOutUpRight');
</script>
@endpush
@endif


@if ($errors->any())
@push('page_script')
<script type="text/javascript">
	showNotification('error', 'Please check the form below for errors', 'top', 'right', 'animated rotateInUpRight', 'animated rotateOutUpRight');
</script>
@endpush
@endif