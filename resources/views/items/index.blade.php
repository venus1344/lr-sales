@extends('layouts.app')

@section('title', 'Items — ' . config('app.name'))
@section('heading', 'Items')

@section('content')
    <livewire:items />
@endsection
