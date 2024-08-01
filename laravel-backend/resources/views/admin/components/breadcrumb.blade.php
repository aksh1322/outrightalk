@if(isset($breadcrumb))
<ol class="breadcrumb m-0">
  <li class="breadcrumb-item"><a href="{{ route('home') }}">Home</a></li>
  @php ($breadcrumbLimit = count($breadcrumb))
  @php ($currentBreadcrumb = 1)
  @foreach($breadcrumb as $key => $val)
  <li class="breadcrumb-item">
    @if($currentBreadcrumb != $breadcrumbLimit)
    <a href="{{ $key }}">{{ $val }}</a>
    @else
    {{ $val }}
    @endif
    @php ($currentBreadcrumb++)
  </li>
  @endforeach
</ol>
@endif