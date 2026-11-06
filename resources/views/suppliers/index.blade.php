@extends('layouts.app')

@section('title', 'Suppliers — ' . config('app.name'))
@section('heading', 'Suppliers')

@section('content')
    <livewire:suppliers />
@endsection
